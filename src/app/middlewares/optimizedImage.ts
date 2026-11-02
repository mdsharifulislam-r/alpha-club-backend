import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const CACHE_DIR = path.join(process.cwd(), 'cache', 'images');
const OPTIMIZED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp']);
const DEFAULT_WIDTH = 1440;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const pending = new Map<string, Promise<void>>();

const safeSource = (urlPath: string) => {
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const relative = decoded.replace(/^[/\\]+/, '');
  if (!relative || relative.includes('\0')) return null;

  const source = path.resolve(UPLOADS_DIR, relative);
  const root = UPLOADS_DIR.endsWith(path.sep) ? UPLOADS_DIR : UPLOADS_DIR + path.sep;
  if (source !== UPLOADS_DIR && !source.startsWith(root)) return null;
  return source;
};

const targetWidth = (query: Request['query']) => {
  const raw = Array.isArray(query.w) ? query.w[0] : query.w;
  const width = Number(raw);
  if (!Number.isFinite(width)) return DEFAULT_WIDTH;
  return Math.min(1920, Math.max(64, Math.round(width)));
};

const sendCached = async (req: Request, res: Response, filePath: string) => {
  const stat = await fs.promises.stat(filePath);
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Cache-Control', CACHE_CONTROL);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(500).end();
      return;
    }
    res.destroy();
  });
  stream.pipe(res);
};

const buildWebp = async (source: string, destination: string, width: number) => {
  await fs.promises.mkdir(CACHE_DIR, { recursive: true });
  const tmp = `${destination}.${process.pid}.tmp`;
  try {
    await sharp(source, { failOn: 'none', limitInputPixels: 80_000_000, sequentialRead: true })
      .rotate()
      .resize({ width, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 72, effort: 4 })
      .toFile(tmp);
    await fs.promises.rename(tmp, destination).catch(async () => {
      await fs.promises.unlink(tmp).catch(() => undefined);
    });
  } catch (error) {
    await fs.promises.unlink(tmp).catch(() => undefined);
    throw error;
  }
};

const ensureCached = (source: string, destination: string, width: number) => {
  const running = pending.get(destination);
  if (running) return running;

  const job = buildWebp(source, destination, width).finally(() => {
    pending.delete(destination);
  });
  pending.set(destination, job);
  return job;
};

export const optimizedImage = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.query.original === '1') return next();

  const ext = path.extname(req.path).toLowerCase();
  if (!OPTIMIZED_EXT.has(ext)) return next();

  const source = safeSource(req.path);
  if (!source) return next();

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(source);
  } catch {
    return next();
  }
  if (!stat.isFile()) return next();

  const width = targetWidth(req.query);
  const cacheName = `${path.relative(UPLOADS_DIR, source).replace(/[\\/]/g, '__')}__w${width}__${Math.round(stat.mtimeMs)}.webp`;
  const cached = path.join(CACHE_DIR, cacheName);

  try {
    await fs.promises.access(cached);
  } catch {
    try {
      await ensureCached(source, cached, width);
    } catch {
      return next();
    }
  }

  try {
    await sendCached(req, res, cached);
  } catch {
    if (!res.headersSent) next();
  }
};

const COMPRESSIBLE = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const compressUploadedImages = async (files: unknown) => {
  if (!files || typeof files !== 'object') return;

  const list = (Array.isArray(files) ? files : Object.values(files as Record<string, unknown[]>).flat()) as {
    path?: string;
  }[];

  await Promise.all(
    list.map(async file => {
      if (!file?.path) return;
      const ext = path.extname(file.path).toLowerCase();
      if (!COMPRESSIBLE.has(ext)) return;

      const tmp = `${file.path}.opt`;
      try {
        let pipeline = sharp(file.path, { failOn: 'none', limitInputPixels: 80_000_000 })
          .rotate()
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true });

        if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
        else if (ext === '.webp') pipeline = pipeline.webp({ quality: 78, effort: 4 });
        else pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });

        await pipeline.toFile(tmp);
        const [before, after] = await Promise.all([fs.promises.stat(file.path), fs.promises.stat(tmp)]);
        if (after.size < before.size) {
          await fs.promises.rename(tmp, file.path);
        } else {
          await fs.promises.unlink(tmp);
        }
      } catch {
        await fs.promises.unlink(tmp).catch(() => undefined);
      }
    }),
  );
};

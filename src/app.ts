import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { optimizedImage } from './app/middlewares/optimizedImage';
import router from './routes';
import { Morgan } from './shared/morgen';
import { UserController } from './app/modules/user/user.controller';
const app = express();
const uploadsDir = path.join(process.cwd(), 'uploads');

app.use(cors({
  origin: true,
  credentials: true
}));

// Resize existing uploads to WebP and stream the cached file.
// Sits ahead of the logger so image requests are not written to disk first.
app.use(optimizedImage);
app.use(express.static(uploadsDir, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//router
app.use('/api/v1', router);
//download app by qr code
app.get('/download', UserController.downloadApp);

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;

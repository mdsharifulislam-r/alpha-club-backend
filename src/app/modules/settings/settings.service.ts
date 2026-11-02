import { StatusCodes } from 'http-status-codes';
import { Settings } from './settings.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

// Get or create the single settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// Upsert about description
const upsertAbout = async (description: string) => {
  const settings = await getOrCreateSettings();
  
  settings.about = { description };
  await settings.save();
  await RedisHelper.bust('settings:*');
  
  return settings;
};

// Upsert privacy policy description
const upsertPrivacyPolicy = async (description: string) => {
  const settings = await getOrCreateSettings();
  
  settings.privacy_policy = { description };
  await settings.save();
  await RedisHelper.bust('settings:*');
  
  return settings;
};

// Upsert terms of services description
const upsertTermsOfServices = async (description: string) => {
  const settings = await getOrCreateSettings();
  
  settings.terms_of_services = { description };
  await settings.save();
  await RedisHelper.bust('settings:*');
  
  return settings;
};

// Get all settings
const getAllSettings = async () => {
  const cache = await RedisHelper.redisGet('settings:all');
  if (cache) {
    return cache;
  }

  const settings = await getOrCreateSettings();
  await RedisHelper.redisSet('settings:all', JSON.parse(JSON.stringify(settings)), {}, HOUR);
  return settings;
};

// Get specific setting
const getAbout = async () => {
  const cache = await RedisHelper.redisGet('settings:about');
  if (cache) {
    return cache;
  }

  const settings = await getOrCreateSettings();
  const result = settings.about || { description: '' };
  await RedisHelper.redisSet('settings:about', result, {}, HOUR);
  return result;
};

const getPrivacyPolicy = async () => {
  const cache = await RedisHelper.redisGet('settings:privacy');
  if (cache) {
    return cache;
  }

  const settings = await getOrCreateSettings();
  const result = settings.privacy_policy || { description: '' };
  await RedisHelper.redisSet('settings:privacy', result, {}, HOUR);
  return result;
};

const getTermsOfServices = async () => {
  const cache = await RedisHelper.redisGet('settings:terms');
  if (cache) {
    return cache;
  }

  const settings = await getOrCreateSettings();
  const result = settings.terms_of_services || { description: '' };
  await RedisHelper.redisSet('settings:terms', result, {}, HOUR);
  return result;
};

export const SettingsService = {
  upsertAbout,
  upsertPrivacyPolicy,
  upsertTermsOfServices,
  getAllSettings,
  getAbout,
  getPrivacyPolicy,
  getTermsOfServices,
};


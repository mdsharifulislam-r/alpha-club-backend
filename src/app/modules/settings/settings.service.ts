import { StatusCodes } from 'http-status-codes';
import { Settings } from './settings.model';

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
  
  return settings;
};

// Upsert privacy policy description
const upsertPrivacyPolicy = async (description: string) => {
  const settings = await getOrCreateSettings();
  
  settings.privacy_policy = { description };
  await settings.save();
  
  return settings;
};

// Upsert terms of services description
const upsertTermsOfServices = async (description: string) => {
  const settings = await getOrCreateSettings();
  
  settings.terms_of_services = { description };
  await settings.save();
  
  return settings;
};

// Get all settings
const getAllSettings = async () => {
  const settings = await getOrCreateSettings();
  return settings;
};

// Get specific setting
const getAbout = async () => {
  const settings = await getOrCreateSettings();
  return settings.about || { description: '' };
};

const getPrivacyPolicy = async () => {
  const settings = await getOrCreateSettings();
  return settings.privacy_policy || { description: '' };
};

const getTermsOfServices = async () => {
  const settings = await getOrCreateSettings();
  return settings.terms_of_services || { description: '' };
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


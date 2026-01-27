import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { MemberShipPlanRoutes } from '../app/modules/membershipPlan/membershipPlan.route';
import { MemberShipFeatureRoutes } from '../app/modules/membershipPlan/memberShipFeatures/memberShipFeatures.route';
import { MemberShipApplicationRoutes } from '../app/modules/membershipApplication/membershipApplication.route';
import { SponsorRoutes } from '../app/modules/sponsor/sponsor.route';
import { PartnerOfferRoutes } from '../app/modules/partnerOffer/partnerOffer.route';
import { ClubRoutes } from '../app/modules/club/club.route';
import { StoryRoutes } from '../app/modules/stories/stories.route';
import { ExclusiveOfferRoutes } from '../app/modules/exclusiveOffer/exclusiveOffer.route';
import { CategoryRoutes } from '../app/modules/exclusiveOffer/category/category.route';
import { EventRoutes } from '../app/modules/event/event.route';
import { SettingsRoutes } from '../app/modules/settings/settings.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { ContactFormRoutes } from '../app/modules/contactForm/contactForm.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { EventRegistrationRoutes } from '../app/modules/event/eventRegistration/eventRegistration.route';
import { ContactUsRoutes } from '../app/modules/contactUs/contactUs.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/membership-plan',
    route: MemberShipPlanRoutes,
  },
  {
    path: '/membership-feature',
    route: MemberShipFeatureRoutes,
  },
  {
    path: '/membership-application',
    route: MemberShipApplicationRoutes,
  },
  {
    path: '/sponsor',
    route: SponsorRoutes,
  },
  {
    path: '/partner-offer',
    route: PartnerOfferRoutes,
  },
  {
    path: '/club',
    route: ClubRoutes,
  },
  {
    path: '/stories',
    route: StoryRoutes,
  },
  {
    path: '/exclusive-offer',
    route: ExclusiveOfferRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/contact-form',
    route: ContactFormRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/event-registration',
    route: EventRegistrationRoutes,
  },
  {
    path: '/contact-us',
    route: ContactUsRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

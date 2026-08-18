import { ForbiddenException } from '@nestjs/common';

export class VerificationRequiredException extends ForbiddenException {
  constructor(
    emailVerified: boolean,
    // phoneVerified: boolean,
  ) {
    super({
      error: 'verification required',
      message: 'Please verify account',
      data: {
        emailVerified,
        // phoneVerified,
        redirectTo: '/resend-email-verification'
        // redirectTo: !emailVerified
        //   ? '/resend-email-verification'
        //   : '/resend-phone-otp',
      },
    });
  }
};

export class OnbaordRequiredException extends ForbiddenException{
  constructor(hasOnBoardCompleted: boolean){

    super({
      error: 'Onboarding required',
      message: 'please complete the onboarding process to personalise your information',
      data: {
        hasOnBoardCompleted,
        redirectTo: '/maternal/onboard'
      }
    })
  }
}
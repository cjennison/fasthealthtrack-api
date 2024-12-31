const { EmailClient } = require('@azure/communication-email');
const { SmsClient } = require('@azure/communication-sms');

const connectionString =
  process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
const emailClient = new EmailClient(connectionString);
const smsClient = new SmsClient(connectionString);

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<boolean> => {
  const emailMessage = {
    senderAddress: `DoNotReply@${process.env['COMMUNICATION_SERVICES_SENDER_EMAIL_DOMAIN']}`,
    content: {
      subject: 'Gesundr: Verify your email address',
      plainText: `Please verify your email address by entering the following code: ${verificationCode}`,
      html: `
          <html>
            <body>
              <h1>Thanks for being apart of Gesundr.</h1>
              <p>Please verify your email address by entering the following code:</p>
              <h2>${verificationCode}</h2>
            </body>
          </html>`,
    },
    recipients: {
      to: [{ address: email }],
    },
  };

  const poller = await emailClient.beginSend(emailMessage);
  const result = await poller.pollUntilDone();
  if (result.status === 'Succeeded') {
    console.log('Email sent successfully');
    return true;
  }

  console.error('Email failed to send');
  return false;
};

const sendVerificationSMS = async (
  phoneNumber: string,
  verificationCode: string
): Promise<void> => {
  try {
    await smsClient.send({
      from: process.env.AZURE_PHONE_NUMBER as string,
      to: [phoneNumber],
      message: `Your verification code is: ${verificationCode}. Visit https://example.com/verify to complete verification.`,
    });
    console.log('Verification SMS sent successfully');
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    throw new Error('Failed to send verification SMS');
  }
};

const verifyCode = (
  storedCode: string | undefined,
  providedCode: string
): boolean => {
  return storedCode === providedCode;
};

export default {
  generateVerificationCode,
  sendVerificationEmail,
  sendVerificationSMS,
  verifyCode,
};

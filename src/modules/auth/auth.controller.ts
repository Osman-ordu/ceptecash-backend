import { Request, Response } from 'express';
import { firebaseAdmin } from '../../lib/firebase';
import { prisma } from '../../lib/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { registerProfileSchema } from './auth.schema';
import { normalizePhoneNumber } from '../../utils/phone.utils';

export const firebaseAuth = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Token missing', 401);
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    const {
      uid,
      email,
      email_verified,
      phone_number,
      name,
      surname,
      picture,
      firebase: firebaseInfo,
    } = decodedToken;

    const provider = firebaseInfo?.sign_in_provider ?? 'password';

    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email!,
          phone: phone_number!,
          ...(name && { name }),
          ...(surname && { surName: surname }),
          ...(picture && { picture }),
          provider,
          emailVerified: email_verified ?? false,
          isVerified: email_verified ?? false,
          passwordHash: '', 
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: email_verified ?? false,
          isVerified: email_verified ?? false,
        },
      });
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return sendSuccess(res, 'Authentication successful', userWithoutPassword);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Invalid token', 401);
  }
};

export const registerProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Token missing', 401);
    }

    const idToken = authHeader.split(' ')[1];

    if (!idToken) {
      return sendError(res, 'Token missing', 401);
    }

    const requestData = req.body?.data || req.body;
    
    if (!requestData || (typeof requestData === 'object' && Object.keys(requestData).length === 0)) {
      return sendError(res, 'Request body is empty or invalid', 400);
    }
    
    const validationResult = registerProfileSchema.safeParse(requestData);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => {
        const field = error.path && error.path.length > 0 
          ? error.path.map(p => String(p)).join('.') 
          : error.path?.[0] ? String(error.path[0]) : 'unknown';
        
        let message = error.message || 'Required';
        
        if (message === 'Required' || (message.includes('Required') && !message.includes(field))) {
          message = `${field} is required`;
        }
        
        return `${field}: ${message}`;
      });
      
      const errorText = errorMessages.length > 0 
        ? errorMessages.join('; ') 
        : JSON.stringify(validationResult.error.errors);
      
      return sendError(
        res,
        'Validation error',
        400,
        errorText
      );
    }

    const { uid, name, surname, phone, email } = validationResult.data;
        const normalizedPhone = normalizePhoneNumber(phone);

    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Firebase token verification failed:', error.message);
      return sendError(res, 'Invalid or expired token', 401);
    }

    if (decodedToken.uid !== uid) {
      console.warn(`UID mismatch: Token UID (${decodedToken.uid}) does not match request UID (${uid})`);
      return sendError(res, 'UID mismatch: Token UID does not match request UID', 403);
    }

    if (decodedToken.email && decodedToken.email !== email) {
      console.warn(`Email mismatch: Token email (${decodedToken.email}) does not match request email (${email})`);
      return sendError(res, 'Email mismatch: Token email does not match request email', 403);
    }

    const [existingUserById, existingUserByFirebaseUid] = await Promise.all([
      prisma.user.findUnique({ where: { id: uid } }),
      prisma.user.findUnique({ where: { firebaseUid: uid } }),
    ]);

    if (existingUserById || existingUserByFirebaseUid) {
      return sendError(res, 'User already exists', 409);
    }

    const [existingUserByPhone, existingUserByEmail] = await Promise.all([
      prisma.user.findUnique({ where: { phone: normalizedPhone } }),
      prisma.user.findUnique({ where: { email } }),
    ]);

    if (existingUserByPhone) {
      return sendError(res, 'Phone number already registered', 409);
    }

    if (existingUserByEmail) {
      return sendError(res, 'Email already registered', 409);
    }

    const user = await prisma.user.create({
      data: {
        id: uid,
        firebaseUid: uid,
        email,
        phone: normalizedPhone,
        ...(name && { name }),
        ...(surname && { surName: surname }),
        passwordHash: '',
        emailVerified: decodedToken.email_verified ?? false,
        isVerified: decodedToken.email_verified ?? false,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return sendSuccess(res, 'Profile registered successfully', userWithoutPassword, 201);
  } catch (error: any) {
    console.error('Register profile error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      const fieldName = field === 'id' ? 'User' : field === 'phone' ? 'Phone number' : field === 'email' ? 'Email' : field;
      return sendError(res, `${fieldName} already exists`, 409);
    }

    if (error.code === 'P2003') {
      return sendError(res, 'Invalid data provided', 400);
    }

    return sendError(
      res,
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
};

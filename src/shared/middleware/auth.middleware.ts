import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError } from '../errors/base.error';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const cognitoSub = req.headers['x-cognito-sub'] as string;
  const cognitoEmail = req.headers['x-cognito-email'] as string;

  if (cognitoSub) {
    req.user = {
      sub: cognitoSub,
      email: cognitoEmail || '',
    };
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    },
    (err, decoded) => {
      if (err) {
        next(new UnauthorizedError('Invalid token'));
        return;
      }

      const payload = decoded as jwt.JwtPayload;
      req.user = {
        sub: payload.sub as string,
        email: payload.email as string,
      };
      next();
    }
  );
};

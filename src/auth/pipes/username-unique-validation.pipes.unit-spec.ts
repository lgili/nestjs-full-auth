import { Test } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { IsUsernameAlreadyExist } from 'src/auth/pipes/username-unique-validation.pipes';

const mockAuthService = () => ({
  findByUsername: jest.fn(),
});
describe('IsUsernameAlreadyExist', () => {
  let authService: AuthService, isUsernameAlreadyExist: IsUsernameAlreadyExist;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IsUsernameAlreadyExist,
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();
    isUsernameAlreadyExist = await module.get<IsUsernameAlreadyExist>(
      IsUsernameAlreadyExist,
    );
    authService = await module.get<AuthService>(AuthService);
  });

  describe('username unique validation', () => {
    it('check for same username', async () => {
      expect(authService.findByUsername).not.toHaveBeenCalled();
      const result = await isUsernameAlreadyExist.validate('tester');
      expect(authService.findByUsername).toHaveBeenCalledWith('tester');
      expect(result).toBe(true);
    });
  });
});

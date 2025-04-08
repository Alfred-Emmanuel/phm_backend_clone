import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StateValidatorPipe } from '../pipes/state-validator.pipe';
import { NigerianStates } from '../../../shared/utils/nigeria-states';

// Example DTO with a state field
class CreateUserWithStateDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  state: NigerianStates;
}

@ApiTags('User Examples')
@Controller('user-examples')
export class UserExampleController {
  @Post('signup-with-state')
  @UsePipes(StateValidatorPipe) // Apply the validator pipe
  @ApiOperation({ summary: 'Example of signup with state normalization' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  async signupWithState(@Body() createUserDto: CreateUserWithStateDto) {
    // By the time we reach this method, the state has already been validated and normalized
    console.log(`User's state was normalized to: ${createUserDto.state}`);

    // Continue with user creation logic...
    return {
      message: 'State was validated and normalized successfully',
      state: createUserDto.state,
    };
  }
}

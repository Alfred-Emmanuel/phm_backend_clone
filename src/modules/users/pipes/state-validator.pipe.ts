import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import {
  isValidNigerianState,
  normalizeNigerianState,
} from '../../../shared/utils/nigeria-states-helpers';
import { NigerianStates } from '../../../shared/utils/nigeria-states';

/**
 * Pipe to validate and normalize Nigerian state values in DTOs
 */
@Injectable()
export class StateValidatorPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation if there's no value or if the input doesn't contain a state property
    if (!value || !value.state) {
      return value;
    }

    // Try to normalize the state value
    const normalizedState = normalizeNigerianState(value.state);

    // If the state is not valid, throw an error
    if (!normalizedState) {
      throw new BadRequestException(
        `"${value.state}" is not a valid Nigerian state`,
      );
    }

    // Replace the input state with the normalized state value
    value.state = normalizedState;

    return value;
  }
}

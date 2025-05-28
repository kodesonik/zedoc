import { SetMetadata } from '@nestjs/common';
import { ApiDocOptions } from '../interfaces/documentation.interface';

export const API_DOC_METADATA = 'api-doc';

export const ApiDoc = (options: ApiDocOptions) => SetMetadata(API_DOC_METADATA, options); 
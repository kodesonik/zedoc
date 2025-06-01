import { SetMetadata } from '@nestjs/common';

export const API_DOC_METADATA = 'api-doc';

export const ApiDoc = (options: any) => SetMetadata(API_DOC_METADATA, options); 
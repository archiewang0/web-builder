import { ElementSchema } from '@/store/use-schema-store';

export type StyleChangeHandler = (partial: NonNullable<ElementSchema['styles']>) => void;

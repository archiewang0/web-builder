import { ElementSchema } from '@/app/context/schema-context';

export type StyleChangeHandler = (partial: NonNullable<ElementSchema['styles']>) => void;

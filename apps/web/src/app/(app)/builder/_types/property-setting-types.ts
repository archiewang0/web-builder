import { ElementSchema } from '@/lib/schema';

export type StyleChangeHandler = (partial: NonNullable<ElementSchema['styles']>) => void;

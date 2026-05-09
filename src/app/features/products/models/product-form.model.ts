export type ProductFormMode = 'create' | 'edit';

export interface ProductFormValue {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

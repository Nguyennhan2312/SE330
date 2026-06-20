export type BorrowRecord = {
  id: number;
  bookTitle?: string;
  title?: string;           // alias
  bookAuthor?: string;
  barcode?: string;
  itemBarcode?: string;     // alias
  borrowedAt?: string;
  checkoutAt?: string;      // alias
  dueDate?: string;
  dueAt?: string;           // alias
  returnedAt?: string | null;
  status?: string;
  fineAmount?: number | null;
  fine?: number | null;     // alias
  overdue?: boolean;
  renewCount?: number;
  maxRenewals?: number;
};

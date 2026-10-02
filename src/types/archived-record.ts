export type ArchivedRecord = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  archivedAt: Date;
};

export type ArchivedListResult = {
  rows: ArchivedRecord[];
  total: number;
  pageCount: number;
};

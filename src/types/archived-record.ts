export type ArchivedRecord = {
  id: string;
  name: string;
  detail: string | null;
  archivedAt: Date;
};

export type ArchivedListResult = {
  rows: ArchivedRecord[];
  total: number;
  pageCount: number;
};

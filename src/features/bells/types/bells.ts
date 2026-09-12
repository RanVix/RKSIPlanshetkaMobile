export interface BellItem {
  id: string;
  number: string;
  time: string;
}

export interface BellScheduleType {
  id: string;
  title: string;
  items: BellItem[];
}

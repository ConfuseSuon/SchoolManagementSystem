
export interface PopulatedStudent {
  _id: string;
  name: string;
}

export interface Complain {
  _id: string;
  studentId: string | PopulatedStudent;
  schoolId: string;
  date: string;
  complaint: string;
}

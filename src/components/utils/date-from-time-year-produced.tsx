export default (time: string | null, year: string | null): string => {
  const timeProduced = time
    ? new Date(time).getFullYear().toString()
    : undefined;
  const yearProduced = year ? year : undefined;
  return yearProduced ? yearProduced : timeProduced ? timeProduced : '';
};

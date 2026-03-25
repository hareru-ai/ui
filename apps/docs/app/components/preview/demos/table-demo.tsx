'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hareru/ui';

export default function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Johnson</TableCell>
          <TableCell>Active</TableCell>
          <TableCell align="right">$1,200</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Smith</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell align="right">$840</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Carol White</TableCell>
          <TableCell>Inactive</TableCell>
          <TableCell align="right">$2,450</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

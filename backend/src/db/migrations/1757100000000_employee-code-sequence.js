/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Race-safe employee_code generation (EMP-1000, EMP-1001, ...) — nextval() is atomic under
  // concurrent inserts, unlike a SELECT COUNT(*)+1 approach.
  pgm.sql(`CREATE SEQUENCE IF NOT EXISTS employee_code_seq START 1000;`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP SEQUENCE IF EXISTS employee_code_seq;`);
};

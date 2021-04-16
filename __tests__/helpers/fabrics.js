import {
  internet, lorem, name,
} from 'faker';
import _ from 'lodash';

export default {
  status: (data) => (_.merge({ name: name.title() }, { ...data })),
  label: (data = {}) => (_.merge({ name: name.title() }, { ...data })),
  user: (data = {}) => (_.merge({
    firstName: name.firstName(),
    lastName: name.lastName(),
    email: internet.email(),
    password: internet.password(),
  }, { ...data })),
  task: (data = {}) => (_.merge({
    name: name.title(), description: lorem.paragraph(),
  }, { ...data })),
};

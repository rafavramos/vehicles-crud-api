import express from 'express';
import users from './modules/users/users';
import login from './modules/auth/login';
import companies from './modules/companies/companies';
import vehicles from './modules/vehicles/vehicles';

const app = express();
const PORT = process.env.PORT || 2899;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', users);
app.use('/auth', login);
app.use('/companies', companies);
app.use('/vehicles', vehicles)

app.listen(PORT, () => {
  console.log(`Api iniciada na porta: ${PORT}`);
});
CREATE TABLE public.companies (
    id SERIAL PRIMARY KEY,
    trade_name VARCHAR(255),
    cnpj VARCHAR(18),
    phone VARCHAR(15),
    mail VARCHAR(255)
);
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    cpf VARCHAR(14),
    phone VARCHAR(15),
    mail VARCHAR(255),
    password VARCHAR(255),
    company_id INT REFERENCES public.companies(id) ON DELETE CASCADE
);
CREATE TABLE public.vehicles (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(255),
    plate VARCHAR(20),
    color VARCHAR(50),
    company_id INT REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE
);

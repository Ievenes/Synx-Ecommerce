module.exports = {
  register: {
    nome_completo: { required: true },
    email: { required: true, email: true },
    senha: { required: true }
  },
  login: {
    email: { required: true, email: true },
    senha: { required: true }
  }
};

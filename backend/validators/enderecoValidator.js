module.exports = {
  create: {
    id_usuario: { required: true },
    rua: { required: true },
    numero: { required: true },
    bairro: { required: true },
    cidade: { required: true },
    estado: { required: true },
    cep: { required: true }
  },
  update: {
    rua: { required: true },
    numero: { required: true },
    bairro: { required: true },
    cidade: { required: true },
    estado: { required: true },
    cep: { required: true }
  }
};

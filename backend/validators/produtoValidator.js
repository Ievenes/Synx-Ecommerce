module.exports = {
  create: {
    codigo: { required: true },
    nome: { required: true },
    preco: { required: true, number: true }
  },
  update: {
    codigo: { required: true },
    nome: { required: true },
    preco: { required: true, number: true }
  }
};

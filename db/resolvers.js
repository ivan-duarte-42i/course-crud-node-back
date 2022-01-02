const User = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
}

const resolvers = {
  Query: {
    obtenerUsuario: async (_, { }, ctx) => {
      return ctx.usuario;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      try {
        const producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("Producto no encontrado");
        } else {
          return producto;
        }
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, { }, ctx) => {
      try {
        const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Cliente no existente");
      }

      try {

        if (cliente.vendedor.toString() !== ctx.usuario.id) {
          throw new Error("No es tu cliente!!");
        }

        return cliente;

      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, { }, ctx) => {
      try {
        const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');
        console.log(pedidos);
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, ctx) => {
      try {
        const pedido = await Pedido.findById(id);
        if (!pedido) {
          throw new Error("No existe el pedido");
        }
        if (pedido.vendedor.toString() !== ctx.usuario.id) {
          throw new Error("El usuario no es tuyo");
        }
        return pedido;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidoEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });
      return pedidos
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$cliente",
            total: { $sum: '$total' }
          }
        },
        {
          $lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: "_id",
            as: "cliente"
          },
        },
        {
          $sort: { total: -1 }
        }
      ]);
      return clientes;
    },
    mejoresVendedores: async () => {
      try {
        const vendedores = await Pedido.aggregate([
          { $match: { estado: "COMPLETADO" } },
          {
            $group: {
              _id: "$vendedor",
              total: { $sum: '$total' }
            }
          },
          {
            $lookup: {
              from: 'usuarios',
              localField: '_id',
              foreignField: "_id",
              as: "vendedor"
            },
          },
          {
            $limit: 3
          },
          {
            $sort: { total: -1 }
          }
        ]);
        return vendedores
      } catch (error) {
        console.log('error', error);
      }
    },
    buscarProducto: async (_, { texto }) => {
      const productos = await Producto.find({ $text: { $search: texto } }).limit(10)
      return productos;
    }
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;
      const existeUsuario = await User.findOne({ email });
      if (existeUsuario) {
        throw new Error("El usuario ya está registrado");
      }

      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        const usuario = await User(input);
        usuario.save();
        return usuario;
      } catch (err) {
        console.log(err);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      const existeUsuario = await User.findOne({ email });
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
      if (!passwordCorrecto) {
        throw new Error("El password es incorrecto");
      }

      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '24h')
      }
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const nuevoProducto = new Producto(input);
        const resultado = await nuevoProducto.save();
        return resultado;
      } catch (error) {
        console.error(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("Producto no encontrado");
        }
        producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });
        return producto;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarProducto: async (_, { id }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("Producto no encontrado");
        }

        await Producto.findOneAndDelete({ _id: id });
        return `Producto Eliminado`;

      } catch (error) {
        console.log(error);
      }
    },
    nuevoCliente: async (_, { input }, ctx) => {
      const { email } = input;
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error("Cliente Existente");
      }

      try {
        const nuevoCliente = new Cliente(input);
        nuevoCliente.vendedor = ctx.usuario.id;
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.error(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("El cliente no existe");
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No es tu cliente!!");
      }

      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, { new: true });
      return cliente
    },
    eliminarCliente: async (_, { id }, ctx) => {
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("El cliente no existe");
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No es tu cliente!!");
      }

      cliente = await Cliente.findOneAndDelete({ _id: id });
      return `Cliente eliminado`;
    },
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      let clienteExiste = await Cliente.findById(cliente);
      if (!clienteExiste) {
        throw new Error("El cliente no existe");
      }
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No es tu cliente!!");
      }
      for await (const articulo of input.pedido) {
        const { id } = articulo;
        const producto = await Producto.findById(id);
        if (articulo.cantidad > producto.existencia) {
          throw new Error(`no hay suficiente cantidad de producots para ${producto.nombre}, solo hay ${producto.existencia} y usted quiere ${articulo.cantidad} `);
        } else {
          producto.existencia = producto.existencia - articulo.cantidad;

          await producto.save();
        }
      }

      const nuevoPedido = new Pedido(input);
      nuevoPedido.vendedor = ctx.usuario.id;
      const resultado = await nuevoPedido.save();
      return resultado;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("No existe el Pedido");
      }

      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("No existe el Cliente");
      }

      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No es tu cliente!!");
      }

      if (existePedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("El usuario no es tuyo");
      }

      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;
          const producto = await Producto.findById(id);
          if (articulo.cantidad > producto.existencia) {
            throw new Error(`no hay suficiente cantidad de producots para ${producto.nombre}, solo hay ${producto.existencia} y usted quiere ${articulo.cantidad} `);
          } else {
            producto.existencia = producto.existencia - articulo.cantidad;
            await producto.save();
          }
        }
      }


      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, { new: true });
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error("No existe el Pedido");
      }

      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("El usuario no es tuyo");
      }

      await Pedido.findOneAndDelete({ _id: id });
      return `Pedido ${id} Eliminado`
    }
  }
}

module.exports = resolvers;
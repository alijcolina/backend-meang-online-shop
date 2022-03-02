import { COLLECTIONS, EXPIRETIME } from '../config/constants';
import { findOneElement } from '../lib/db-operations';
import JWT from '../lib/jwt';
import { IContextData } from './../interfaces/context-data.interface';
import MailService from './mail.service';
import ResolversOperationsService from './resolvers-operations.services';
import bcrypt from 'bcrypt';

class PasswordService extends ResolversOperationsService {
  constructor(root: object, variables: object, context: IContextData) {
    super(root, variables, context);
  }
  async sendMail() {
    const email = this.getVariables().user?.email || '';
    if (email === undefined || email === '') {
      return {
        status: false,
        message: 'El email no se ha definido correctamente',
      };
    }
    // Coger información del usuario
    const user = await findOneElement(this.getDb(), COLLECTIONS.USERS, {
      email,
    });
    console.log(user);
    // Sí el usuario es indefinido mandamos un mensaje que no eziste el usuario
    if (user === undefined || user === null) {
      return {
        status: false,
        message: `Usuario con el email ${email} no existe`,
      };
    }
    const newUser = {
      id: user.id,
      email,
    };
    const token = new JWT().sign({ user: newUser }, EXPIRETIME.M15);
    const html = `Para cambiar de contraseña haz click sobre esto: <a href="${process.env.CLIENT_URL}/#/reset/${token}">Click aquí</a>`;
    const mail = {
      subject: 'Petición para cambiar de contraseña',
      to: email,
      html,
    };
    return new MailService().send(mail);
  }

  async change(){
    const id = this.getVariables().user?.id;
    let password = this.getVariables().user?.password;
      // Comprobar que el id es correcto: No indefinido y no en blanco
    if (id === undefined || id === '') {
    return {
        status: false,
        message: 'El ID necesita una información correcta'
    };
    }
    // Comprobar que el password es correcto: No indefinido y no en blanco
    if (password === undefined || password === '' || password === '1234') {
        return {
            status: false,
            message: 'El password necesita una información correcta'
        };
    }
    // Encriptar el password
    password = bcrypt.hashSync(password, 10);
    // Actualizar el id seleccionado de la colección de usuarios
    const result = await this.update(
        COLLECTIONS.USERS,
        { id },
        { password },
        'users'
      ) ;
  
      return {
        status: result.status,
        message: (result.status) ? 'Contraseña cambiada correctamente' :
                                    result.message
      };
  }
}

export default PasswordService;

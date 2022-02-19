import { IVariables } from './../schema/interfaces/variable.interface';
import { IContextData } from './../interfaces/context-data.interface';
import {
  deleteOneElement,
  findElements,
  findOneElement,
  insertOneElement,
  updateOneElement,
} from './../lib/db-operations';
import { Db } from 'mongodb';

class ResolversOperationsService {
  private root: object;
  private variables: IVariables;
  private context: IContextData;
  constructor(root: object, variables: IVariables, context: IContextData) {
    this.root = root;
    this.variables = variables;
    this.context = context;
  }
  protected getContext(): IContextData { return this.context; }
  protected getDb(): Db {
    return this.context.db!;
  }
  protected getVariables(): IVariables {
    return this.variables;
  }
  // Listar información
  protected async list(collection: string, listElement: string) {
    try {
      return {
        status: true,
        message: `Lista de ${listElement} correctamente cargada`,
        items: await findElements(this.getDb(), collection),
      };
    } catch (error) {
      return {
        status: false,
        message: `Lista de ${listElement} no cargada ${error}`,
        items: null,
      };
    }
  }
  // Obtener detalles del item seleccionado
  protected async get(collection: string) {
    const collectionLabel = collection.toLowerCase();
    try {
      return await findOneElement(this.getDb(), collection, {
        id: this.variables.id,
      }).then((result) => {
        if (result) {
          return {
            status: true,
            message: `${collectionLabel} ha sido cargada correctamente con sus detalles`,
            item: result,
          };
        }
        return {
          status: true,
          message: `${collectionLabel} no ha obtenido detalles`,
          item: null,
        };
      });
    } catch (error) {
      return {
        status: false,
        message: `Error inesperado al querer cargar los detalles de ${collectionLabel}`,
        item: null,
      };
    }
  }
  // Añadir item
  protected async add(collection: string, document: object, item: string) {
    try {
      return await insertOneElement(this.getDb(), collection, document).then(
        (res) => {
          if (res.result.ok === 1) {
            return {
              status: true,
              message: `Añadido correctamente el ${item}.`,
              item: document,
            };
          }
          return {
            status: false,
            message: `No se ha insertado el ${item}. Itentalo de nuevo`,
            item: null,
          };
        }
      );
    } catch (error) {
      return {
        status: false,
        message: `Error inesperado al insertar el ${item}. Iténtalo de nuevo`,
        item: null,
      };
    }
  }
  // Modificar item
  protected async update(
    collection: string,
    filter: object,
    objectUpdate: object,
    item: string
  ) {
    try {
      return await updateOneElement(
        this.getDb(),
        collection,
        filter,
        objectUpdate
      ).then((res) => {
        if (res.result.nModified === 1 && res.result.ok) {
          return {
            status: true,
            message: `Elemento del item ${item}. Actualizado correctamente`,
            item: Object.assign({}, filter, objectUpdate),
          };
        }
        return {
          status: false,
          message: `Error del ${item}. No se ha actializado. comprueba que estás filtrando correctamente o simplemente que no hay nada que actualizar`,
          item: null,
        };
      });
    } catch (error) {
      return {
        status: false,
        message: `Error inesperado al actualizar el ${item}. Iténtalo de nuevo`,
        item: null,
      };
    }
  }
  // Eliminar item

  protected async del(collection: string, filter: object, item: string) {
    try {
      return await deleteOneElement(this.getDb(), collection, filter).then(
        (res) => {
          if (res.deletedCount === 1) {
            return {
              status: true,
              message: `Elemento del ${item} borrado correctamente.`,
            };
          }
          return {
            status: false,
            message: `Elemento del ${item} No se ha borrado. Comprueba el filtro`,
          };
        }
      );
    } catch (error) {
      return {
        status: false,
        message: `Error inesperado al eliminar el ${item}. Iténtalo de nuevo`,
      };
    }
  }
}

export default ResolversOperationsService;
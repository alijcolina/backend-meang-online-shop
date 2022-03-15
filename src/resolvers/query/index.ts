import GMR  from 'graphql-merge-resolvers';
import resolversGenreQuery from './genre';
import resolversShopProductsQuery from './shop-product';
import resolversUserQuery from './user';

const queryResolvers = GMR.merge([
    resolversUserQuery,
    resolversShopProductsQuery,
    resolversGenreQuery
]);

export default queryResolvers;
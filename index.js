const {ApolloServer, gql} = require('apollo-server');
const squel = require('squel').useFlavour('postgres');
const pgp = require('pg-promise')();

const db = pgp({
  host: 'localhost',
  port: 5432,
  user: '',
  database: '180gram',
  password: ''
});

// QUERIES
const getVariants = ({limit}) => {
  const query = squel.select().from('variants')
  if(limit) query.limit(limit);
  return query.toString();
}

const getVariantById = ({id}) => {
  return squel.select()
    .from('variants')
    .where('id = ?', id)
    .toString();
}

const getRetailers = ({limit}) => {
  const query = squel.select().from('retailers')
  if(limit) query.limit(limit);
  return query.toString();
}

const getRetailerById = ({retailer_id}) => {
  return squel.select()
    .from('retailers')
    .where('id = ?', retailer_id)
    .toString();
}

// DEFS
const typeDefs = gql`

  type Retailer {
    name: String
  }

  type Variant {
    id: Int,
    shop_url: String,
    retailer: Retailer,
  }

  type Query {
    variantById(id: Int): Variant,
    variants(limit: Int): [Variant],
    retailers(limit: Int): [Retailer],
  }
`;

// RESOLVERS
const resolvers = {
  Query: {
    retailers: async (parents, args) => await db.many(getRetailers(args)),
    variants: async (parents, args) => await db.many(getVariants(args)),
    variantById: async (parent, args) => await db.one(getVariantById(args)),
  },

  Variant: {
    retailer: async (parent) => await db.one(getRetailerById(parent))
  }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});

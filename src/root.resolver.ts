module.exports = {
    Query: {
        hello: (_parent: any, params: any) => {
            return {
                greetings: `Hello ${params.name}!!!`,
                percent: 0.2,
                params
            }
        }
    },
    Subquery: {
        hra: (parent: any, params: any) => {
            console.log('Parent Data:', parent);
            console.log('Params:', params);
            return params.basic as number
        }
    }
}
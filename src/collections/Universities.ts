import { CollectionConfig } from "payload/types";

const Universities: CollectionConfig = {
    slug: 'universities',
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'timezone',
            type: 'select',
            options: Intl.supportedValuesOf('timeZone')
        },
        {
            name: 'website',
            type: 'text',
        }
    ]
}

export default Universities;
import { CollectionConfig } from "payload/types";
import Media from "./Media";

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
            name: 'website',
            type: 'text',
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: Media.slug,
        },
        {
            name: 'university',
            type: 'group',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'logo',
                    type: 'upload',
                    relationTo: Media.slug,
                },
                {
                    name: 'location',
                    type: 'point',
                },
            ]
        },
        {
            name: 'timezone',
            type: 'select',
            options: Intl.supportedValuesOf('timeZone')
        },
        {
            name: 'emailDomains',
            type: 'array',
            fields: [
                {
                    name: 'domain',
                    type: 'text',
                    required: true
                }
            ]
        }
    ]
}

export default Universities;
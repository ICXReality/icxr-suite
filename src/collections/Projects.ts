import { CollectionConfig } from "payload/types";

const Projects: CollectionConfig = {
    slug: 'projects',
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
            name: 'university',
            type: 'relationship',
            relationTo: 'universities',
            required: true
        }
    ]
}

export default Projects;
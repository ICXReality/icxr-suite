import { CollectionConfig } from "payload/types";

const Events: CollectionConfig = {
    slug: 'events',
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
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'Approved',
            options: ['Pending', 'Approved', 'Rejected']
        },
        {
            name: 'type',
            type: 'text',
            required: true
        },
        {
            name: 'description',
            type: 'textarea'
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'startDate',
                    type: 'date',
                    required: true
                },
                {
                    name: 'endDate',
                    type: 'date',
                    required: true
                }
            ]
        },
        {
            name: 'attendance',
            type: 'number',
            required: true,
            defaultValue: 0
        }
    ]
}

export default Events;
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'

const randomName = () => uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ', style: 'capital' })

export default randomName
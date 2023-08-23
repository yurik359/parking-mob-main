import axios from 'axios'


const baseURL = 'http://localhost:4001/';

const allParkomatsAPI   = baseURL + 'getAllParkomats'
const getAddressesAPI   = baseURL + 'getAddresses?address='
const getPlaceIdAPI     = baseURL + 'getPlaceId'
const getPaymentPageAPI = baseURL + 'getPaymentUrl'

export const getAllParkomats = () => axios.get(allParkomatsAPI)
export const getAddresses    = (payload) => axios.get(`${getAddressesAPI}${payload}`)
export const getPlaceId      = (id) => axios.get(getPlaceIdAPI+id)
export const getPaymentPage  = () => axios.get(getPaymentPageAPI)
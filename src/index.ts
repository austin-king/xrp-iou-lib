import { 
  accountLines,
  enableRippling,
  initWS,
  openTrustline
} from './lib'

// address constants
const genesisAddress = 'rGWDJKnxsVtKXwNbbWAEvaXT6sre3U5S1o'
const genesisSecret = 'shqkLPE2FmUQS9rU9umtsmoiZumPf'
const recipientAddress = 'rwqcKzKfzQa8nMbRJBtbd3KKudiCHUVfYb'

// IOU constants
const currency = 'USD'

async function main() {
  await initWS()
  await enableRippling(genesisAddress, genesisSecret)
  await openTrustline(
    genesisAddress, 
    genesisSecret, 
    recipientAddress, 
    currency
  )
  await accountLines(genesisAddress)
}

main()

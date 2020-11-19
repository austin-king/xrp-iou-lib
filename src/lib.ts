/* eslint-disable no-await-in-loop */
import axios from 'axios'
import bigInt from 'big-integer'
import { RippleAPI } from 'ripple-lib'
import { BigNumber } from 'bignumber.js'

BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: 4 })

export const api = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233',
})

export const initWS = async (): Promise<boolean> => {
  try {
    await api.connect()
    return true
  } catch (error) {
    return false
  }
}

export async function accountLines(address: string) {
  const json = {
    method: "account_lines",
    params: [
      {
        account: address
      }
    ]
  }

  const resp = await axios.post('https://s.altnet.rippletest.net:51234', json)
  console.log(resp.data.result.lines)
}

export const enableRippling = async (
  genesisAddress: string,
  genesisSecret: string,
): Promise<void> => {
  const preppedSettings = await api.prepareSettings(genesisAddress, {
    defaultRipple: true,
  })
  const submittedSettings = await api.submit(
    api.sign(preppedSettings.txJSON, genesisSecret).signedTransaction,
  )
  console.log('Submitted Set Default Ripple', submittedSettings)
}

export const openTrustline = async (
  sourceAddress: string,
  sourceSecret: string,
  genesisAddress: string,
  currency: string,
): Promise<void> => {
  const preparedTrustline = await api.prepareTrustline(sourceAddress, {
    currency,
    counterparty: genesisAddress,
    limit: '100000',
    ripplingDisabled: false,
  })

  const signature = api.sign(preparedTrustline.txJSON, sourceSecret)
    .signedTransaction

  const submitResponse = await api.submit(signature)

  console.log('Trustline Submit Response', submitResponse)
}

// currently unused in index.ts
export const issueTokens = async (
  genesisAddress: string,
  genesisSecret: string,
  destinationAddress: string,
  currency: string,
  value: string,
  adjustmentRate: number,
): Promise<void> => {
  const adjustedValue = new BigNumber(value)
    .dividedBy(adjustmentRate)
    .toString()
  const preparedTokenIssuance = await api.preparePayment(genesisAddress, {
    source: {
      address: genesisAddress,
      maxAmount: {
        value: adjustedValue,
        currency,
        counterparty: genesisAddress,
      },
    },
    destination: {
      address: destinationAddress,
      amount: {
        value: adjustedValue,
        currency,
        counterparty: genesisAddress,
      },
    },
  })
  const issuanceResponse = await api.submit(
    api.sign(preparedTokenIssuance.txJSON, genesisSecret).signedTransaction,
  )

  console.log('Issuance Submition Response', issuanceResponse)
}

interface TokenSend {
  sourceAddress: string
  sourceSecret: string
  destinationAddress: string
  genesisAddress: string
  currency: string
  value: string
  adjustmentRate: number
}

// additionally unused in index.ts
export const sendTokens = async (data: TokenSend): Promise<void> => {
  const value = new BigNumber(data.value)
    .dividedBy(data.adjustmentRate)
    .toString()
  const preparedTokenPayment = await api.preparePayment(data.sourceAddress, {
    source: {
      address: data.sourceAddress,
      maxAmount: {
        value,
        currency: data.currency,
        counterparty: data.genesisAddress,
      },
    },
    destination: {
      address: data.destinationAddress,
      amount: {
        value,
        currency: data.currency,
        counterparty: data.genesisAddress,
      },
    },
  })
  const tokenPaymentResponse = await api.submit(
    api.sign(preparedTokenPayment.txJSON, data.sourceSecret).signedTransaction,
  )

  console.log('Token Payment Response', tokenPaymentResponse)
}

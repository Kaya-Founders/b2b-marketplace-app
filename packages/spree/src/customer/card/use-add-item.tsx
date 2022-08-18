import useAddItem from '@vercel/commerce/customer/card/use-add-item'
import type {
  AddItemHook,
  CardFields,
} from '@vercel/commerce/types/customer/card'
import { useCallback } from 'react'
import type { UseAddItem } from '@vercel/commerce/customer/card/use-add-item'
import type { MutationHook } from '@vercel/commerce/utils/types'
import type { GraphQLFetcherResult } from '@vercel/commerce/api'
import { ICreditCard } from '@spree/storefront-api-v2-sdk/types/interfaces/CreditCard'
import useCustomer from '../use-customer'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from '../../utils/tokens/ensure-itoken'

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query
    url: 'checkout',
    query: 'addPayment',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useAddItem fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )

    const {
      cardHolder,
      cardNumber,
      cardExpireDate,
      cardCvc,
      firstName,
      lastName,
      company,
      streetNumber,
      zipCode,
      city,
      country,
    } = input

    let token: IToken | undefined = ensureIToken()

    const addItemParameters: CardFields = {
      cardHolder: cardHolder,
      cardNumber: cardNumber,
      cardExpireDate: cardExpireDate,
      cardCvc: cardCvc,
      firstName: firstName,
      lastName: lastName,
      company: company,
      streetNumber: streetNumber,
      zipCode: zipCode,
      city: city,
      country: country,
    }

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<ICreditCard>
    >({
      variables: {
        methodPath: 'checkout.addPayment',
        arguments: [token, addItemParameters],
      },
    })

    return { data: spreeSuccessResponse.data, isLoading: !spreeSuccessResponse }
  },
  useHook: ({ fetch }) => {
    const useWrappedHook: ReturnType<
      MutationHook<AddItemHook>['useHook']
    > = () => {
      const { mutate } = useCustomer()

      return useCallback(
        async (input) => {
          const data = await fetch({ input })

          await mutate(data, false)

          return data
        },
        [mutate]
      )
    }

    return useWrappedHook
  },
}

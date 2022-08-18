import useAddItem from '@vercel/commerce/customer/address/use-add-item'
import type {
  AddItemHook,
  AddressFields,
} from '@vercel/commerce/types/customer/address'
import { useCallback } from 'react'
import type { UseAddItem } from '@vercel/commerce/customer/address/use-add-item'
import type { MutationHook } from '@vercel/commerce/utils/types'
import type { GraphQLFetcherResult } from '@vercel/commerce/api'
import { CreateAddressOptions } from '@spree/storefront-api-v2-sdk/types/interfaces/Account'
import useCustomer from '../use-customer'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from '../../utils/tokens/ensure-itoken'

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query
    url: 'account',
    query: 'createAddress',
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
      type,
      firstName,
      lastName,
      company,
      streetNumber,
      apartments,
      zipCode,
      city,
      country,
    } = input

    let token: IToken | undefined = ensureIToken()

    const addItemParameters: AddressFields = {
      type: type,
      firstName: firstName,
      lastName: lastName,
      company: company,
      streetNumber: streetNumber,
      apartments: apartments,
      zipCode: zipCode,
      city: city,
      country: country,
    }

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<CreateAddressOptions>
    >({
      variables: {
        methodPath: 'account.createAddress',
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

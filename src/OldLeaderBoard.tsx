import {
  Flex,
  Button,
  Box,
  Heading,
  Text,
  Input,
  HStack,
  useToast,
} from '@chakra-ui/react'
import {includes, sortBy, get} from 'lodash-es'
import {useState} from 'react'

import leaderboard2021 from './data/2021'
import leaderboard2022 from './data/2022.json'
import divisions from './data/divisions.json'
export type Athlete = typeof leaderboard2022[0]
type Props = {
  onAthleteClick: ({
    athlete,
    action,
  }: {
    athlete: Athlete
    action: 'add' | 'delete'
  }) => void
  chosenAthletes: Athlete[]
}
export default function OldLeaderBoard({
  onAthleteClick,
  chosenAthletes,
}: Props) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 1 | 2>('all')
  return (
    <Flex wrap="wrap" flexGrow={1} gap={3}>
      <Input
        placeholder="Search for an athlete"
        w="100%"
        my={3}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <HStack>
        <Button
          colorScheme="blue"
          variant={genderFilter === 'all' ? 'solid' : 'outline'}
          size="sm"
          borderRadius="100px"
          onClick={() => setGenderFilter('all')}
        >
          All
        </Button>
        <Button
          colorScheme="blue"
          variant={genderFilter === 1 ? 'solid' : 'outline'}
          size="sm"
          borderRadius="100px"
          onClick={() => setGenderFilter(1)}
        >
          Men
        </Button>
        <Button
          colorScheme="blue"
          variant={genderFilter === 2 ? 'solid' : 'outline'}
          size="sm"
          borderRadius="100px"
          onClick={() => setGenderFilter(2)}
        >
          Women
        </Button>
      </HStack>
      {sortBy(leaderboard2022, [
        'open_division_id',
        (athlete) => {
          const score2021 = leaderboard2021.find(
            (a) =>
              a.competitor_name.toLowerCase() ===
              athlete.competitor_name.toLowerCase(),
          )

          return score2021?.overall_placement ?? 999
        },
      ])
        .filter(
          (a) =>
            a.competitor_name.toLowerCase().includes(search.toLowerCase()) &&
            (genderFilter === 'all' || genderFilter === a.open_division_id),
        )
        .map((athlete) => {
          const score2021 = leaderboard2021.find(
            (a) =>
              a.competitor_name.toLowerCase() ===
              athlete.competitor_name.toLowerCase(),
          )
          const isQueued = includes(
            chosenAthletes.map((a) => a.competitor_name),
            athlete.competitor_name,
          )

          return (
            <Flex
              key={athlete.competitor_name}
              justifyContent="space-around"
              alignItems={'center'}
              bg="blue-300"
              flexBasis="100%"
              borderBottom="1px"
              borderColor="blue.50"
            >
              <Box flexBasis="45%">
                <Heading color="blue.800" mb={3} as="h2" size={'sm'}>
                  {athlete.competitor_name}
                </Heading>
                <Flex justifyContent={'space-between'} mb={2}>
                  <Flex direction={'column'}>
                    <Heading as="h3" size={'xs'} color="blue.400">
                      Division
                    </Heading>
                    <Text color="blue.700">
                      {get(divisions, athlete?.open_division_id)}
                    </Text>
                  </Flex>
                  <Flex direction={'column'}>
                    <Heading as="h3" size={'xs'} color="blue.400">
                      Rank
                    </Heading>
                    <Text color="blue.700">
                      {score2021?.overall_placement
                        ? score2021?.overall_placement
                        : 'N/A'}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
              <Button
                colorScheme={isQueued ? 'red' : 'blue'}
                onClick={() => {
                  onAthleteClick({
                    athlete,
                    action: isQueued ? 'delete' : 'add',
                  })
                  toast({
                    title: `${isQueued ? 'Removed' : 'Added'} Athlete ${
                      isQueued ? 'from' : 'to'
                    } your pick`,
                    status: isQueued ? 'error' : 'success',
                    duration: 2000,
                    isClosable: true,
                  })
                }}
              >
                {isQueued ? 'Remove' : 'Add'}
              </Button>
            </Flex>
          )
        })}
    </Flex>
  )
}

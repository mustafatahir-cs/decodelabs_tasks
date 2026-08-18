# Testing Documentation

## Automated Test Suite

Project 2 contains eight automated tests using Node.js built-in test runner.

| ID | Test | Status |
|---|---|---|
| P2-T01 | Valid decision accepted | PASS |
| P2-T02 | Confidence above 100 rejected | PASS |
| P2-T03 | Fewer than two options rejected | PASS |
| P2-T04 | Invalid selected option rejected | PASS |
| P2-T05 | Valid outcome review accepted | PASS |
| P2-T06 | Invalid outcome score rejected | PASS |
| P2-T07 | Category filtering works | PASS |
| P2-T08 | Insights calculation works | PASS |

## Final Automated Result

```text
tests 8
pass 8
fail 0
```

The raw test-run output is available in `TEST_OUTPUT.txt`.

## Manual Testing

The API was also tested with Postman for:

- health endpoint
- decision retrieval
- decision creation
- filtering
- outcome review
- insights
- validation error
- 404 behaviour

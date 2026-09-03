# Source packet: music

- source_id: MUSIC-2025-02
- source_type: archive lookup
- SOURCE_STATUS: unavailable

The archive request timed out before it returned documents. This file is a
fixture for the failure path, not evidence about music. Do not turn the timeout
into an empty successful result. Return `status: partial_failure`, include the
attempted query, and say that music production is not covered.

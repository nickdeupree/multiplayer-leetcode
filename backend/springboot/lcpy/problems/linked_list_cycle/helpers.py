from leetcode_py import ListNode


def create_cycle_list(values: list[int], pos: int) -> ListNode[int] | None:
    # Validate inputs to give clear error messages if arguments are swapped
    if isinstance(values, int) and isinstance(pos, (list, tuple)):
        raise TypeError("create_cycle_list: 'values' should be a list[int] and 'pos' should be an int; it looks like the arguments were passed in the wrong order (pos, values)")
    if not isinstance(values, (list, tuple)):
        raise TypeError(f"create_cycle_list: 'values' must be a list[int], got {type(values).__name__}")
    if not isinstance(pos, int):
        raise TypeError(f"create_cycle_list: 'pos' must be an int, got {type(pos).__name__}")

    if len(values) == 0:
        return None

    nodes: list[ListNode[int]] = []
    head = ListNode(values[0])
    nodes.append(head)
    current = head

    for i in range(1, len(values)):
        current.next = ListNode(values[i])
        current = current.next
        nodes.append(current)

    if pos != -1 and 0 <= pos < len(nodes):
        current.next = nodes[pos]

    return head


def run_has_cycle(solution_class: type, values: list[int], pos: int):
    # Validate argument types early so callers get a helpful error message
    if isinstance(values, int) and isinstance(pos, (list, tuple)):
        raise TypeError("run_has_cycle: it looks like you passed (Solution, pos, values) — the correct call is run_has_cycle(Solution, values, pos)")
    if not isinstance(values, (list, tuple)):
        raise TypeError(f"run_has_cycle: 'values' must be a list[int], got {type(values).__name__}")
    if not isinstance(pos, int):
        raise TypeError(f"run_has_cycle: 'pos' must be an int, got {type(pos).__name__}")

    head = create_cycle_list(values, pos)
    implementation = solution_class()
    return implementation.has_cycle(head)


def assert_has_cycle(result: bool, expected: bool) -> bool:
    assert result == expected
    return True

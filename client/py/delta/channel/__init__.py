from dataclasses import dataclass

from delta import telem


@dataclass
class Channel:
    key: str = ""
    name: str = ""
    node_id: int = 0
    data_rate: telem.DataRate = telem.DataRate(0)
    data_type: telem.DataType = telem.DataType(0)

use crate::query::{OpSetMetadata, QueryResult, TreeQuery, VisWindow};
use crate::types::{Clock, ElemId, Op};
use std::fmt::Debug;

#[derive(Debug, Clone, PartialEq)]
pub(crate) struct ListValsAt {
    clock: Clock,
    last_elem: Option<ElemId>,
    pub(crate) ops: Vec<Op>,
    window: VisWindow,
    pos: usize,
}

impl ListValsAt {
    pub(crate) fn new(clock: Clock) -> Self {
        ListValsAt {
            clock,
            last_elem: None,
            ops: vec![],
            window: Default::default(),
            pos: 0,
        }
    }
}

impl<'a> TreeQuery<'a> for ListValsAt {
    fn query_element_with_metadata(&mut self, op: &'a Op, m: &OpSetMetadata) -> QueryResult {
        if op.insert {
            self.last_elem = None;
        }
        if self.last_elem.is_none() && self.window.visible_at(op, self.pos, &self.clock) {
            for (_, vop) in self.window.seen_op(op, self.pos) {
                self.last_elem = vop.elemid();
                if vop.is_counter() {
                    // this could be out of order - because of inc's - insert in the right place
                    let pos = self
                        .ops
                        .binary_search_by(|probe| m.lamport_cmp(probe.id, op.id))
                        .unwrap_err();
                    self.ops.insert(pos, vop);
                } else {
                    self.ops.push(vop);
                }
            }
        }
        self.pos += 1;
        QueryResult::Next
    }
}

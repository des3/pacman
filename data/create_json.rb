# input csv file ARGV[1]
# output json

# TODO: refactor code so you can handle any number of columns in CSV file


require "csv"
require "json"

def iterate_though_nodes(parent_node)
  # quit when you reach deepest level
  return unless parent_node[:children]

  # add a base_child w parent's size
  if parent_node[:size]
    base_child = {:name => parent_node[:name] + "-base", :size => parent_node[:size]}
    parent_node.delete(:size)
    parent_node[:children] << base_child
  end

  # recurse through all children
  parent_node[:children].each do |c|
    iterate_though_nodes(c)
  end
end

def create_node_hash(arr)
  obj = []

  arr.each_with_index do |a, i|
    o = {
      :id => i + 1,
      :parent_id => 0,
      :attr1 => a[0],
      :attr2 => a[1],
      :attr3 => a[2],
      :attr4 => a[3],
    }
    o_depth = 4 - a.count { |x| x == nil}
    o[:name] = a[o_depth - 1]
    o[:size] = a[4]

    # search through existing set to find a parent
    obj.each_with_index do |b, j|

      b_depth = 4 - (b[:attr1] == nil ? 1 : 0) - (b[:attr2] == nil ? 1 : 0) - (b[:attr3] == nil ? 1 : 0) - (b[:attr4] == nil ? 1 : 0)
      next unless o_depth - b_depth == 1

      cond1, cond2, cond3 = true, true, true
      cond1 = o[:attr1] == b[:attr1] if b_depth >= 1
      cond2 = o[:attr2] == b[:attr2] if b_depth >= 2 
      cond3 = o[:attr3] == b[:attr3] if b_depth >= 3 

      o[:parent_id] = j + 1 if cond1 && cond2 && cond3
    end

    obj << o
  end

  obj
end

if __FILE__ == $0
  # input_file = "issues.csv"

  input_file = ARGV[0]
  output_file = File.basename(input_file, ".*") + ".json"

  arr = CSV.read(input_file)
  obj = create_node_hash(arr)

  # add a root node
  obj.unshift({:id => 0, :root => true, :name => "root"})

  # loop through each node, assigning them to their parents
  obj.each do |o|
    next if o[:root]

    children = obj[o[:parent_id]][:children] ||= []
    children << o
  end

  # obj[0] has root w all children
  iterate_though_nodes(obj[0])

  File.open(output_file, 'w') { |f| f.write(JSON.pretty_generate(obj[0])) }

end